package com.mitu.assistant.native

import android.Manifest
import android.app.Service
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleService
import com.mitu.assistant.R

class MituForegroundService : LifecycleService() {
    private var cameraProvider: ProcessCameraProvider? = null
    private var handTracker: MediaPipeHandTracker? = null
    private var wakeWordDetector: WakeWordDetector? = null
    private var started = false

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopSelf()
            return Service.START_NOT_STICKY
        }
        if (!started) {
            started = true
            startForegroundCompat()
            startWakeWordListener()
            startCameraTracking()
        }
        return Service.START_STICKY
    }

    override fun onDestroy() {
        wakeWordDetector?.stop()
        wakeWordDetector = null
        cameraProvider?.unbindAll()
        cameraProvider = null
        handTracker?.close()
        handTracker = null
        started = false
        super.onDestroy()
    }

    override fun onBind(intent: Intent): IBinder? = super.onBind(intent)

    private fun startForegroundCompat() {
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_mitu_launcher)
            .setContentTitle(getString(R.string.app_name))
            .setContentText(getString(R.string.foreground_service_notification))
            .setOngoing(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_CAMERA or ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE,
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun startWakeWordListener() {
        wakeWordDetector = AndroidSpeechWakeWordDetector(this) {
            LockScreenWakeController(this).wakeAndOpenAssistant()
        }.also { it.start() }
    }

    private fun startCameraTracking() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            Log.w(TAG, "Camera permission is not granted; hand tracking remains paused.")
            return
        }
        handTracker = runCatching {
            MediaPipeHandTracker(
                context = this,
                onAction = { action -> MituAccessibilityService.instance()?.dispatch(action) },
                onError = { error -> Log.e(TAG, "MediaPipe hand tracker failed", error) },
            )
        }.onFailure {
            Log.e(TAG, "MediaPipe model is unavailable; hand tracking remains paused.", it)
        }.getOrNull()

        val cameraFuture = ProcessCameraProvider.getInstance(this)
        cameraFuture.addListener({
            val provider = runCatching { cameraFuture.get() }.getOrNull() ?: return@addListener
            cameraProvider = provider
            val analysis = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
            analysis.setAnalyzer(ContextCompat.getMainExecutor(this)) { image ->
                runCatching { handTracker?.process(image) }
                    .onFailure { Log.e(TAG, "Camera frame processing failed", it) }
                image.close()
            }
            runCatching {
                provider.unbindAll()
                provider.bindToLifecycle(this, CameraSelector.DEFAULT_FRONT_CAMERA, analysis)
            }.onFailure { Log.e(TAG, "Unable to bind the background camera", it) }
        }, ContextCompat.getMainExecutor(this))
    }

    companion object {
        const val CHANNEL_ID = "mitu_assistant"
        const val ACTION_START = "com.mitu.assistant.action.START"
        const val ACTION_STOP = "com.mitu.assistant.action.STOP"
        private const val TAG = "MituForegroundService"
        private const val NOTIFICATION_ID = 4101
    }
}