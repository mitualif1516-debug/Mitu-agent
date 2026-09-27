package com.mitu.assistant.native

import android.content.Context
import androidx.camera.core.ImageProxy
import com.google.mediapipe.framework.image.MediaImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.ImageProcessingOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import kotlin.math.hypot

/**
 * MediaPipe live-stream adapter. The hand_landmarker.task file is kept in the
 * app assets so processing stays on-device and never uploads camera frames.
 */
class MediaPipeHandTracker(
    context: Context,
    private val onAction: (GestureAction) -> Unit,
    private val onError: (Throwable) -> Unit = {},
) {
    private val handLandmarker: HandLandmarker
    private var previousPalmX: Float? = null

    init {
        val options = HandLandmarker.HandLandmarkerOptions.builder()
            .setBaseOptions(
                BaseOptions.builder()
                    .setModelAssetPath(MODEL_ASSET)
                    .build(),
            )
            .setRunningMode(RunningMode.LIVE_STREAM)
            .setNumHands(1)
            .setMinHandDetectionConfidence(0.5f)
            .setMinHandPresenceConfidence(0.5f)
            .setMinTrackingConfidence(0.5f)
            .setResultListener { result, _ -> handleResult(result) }
            .setErrorListener { error -> onError(error) }
            .build()
        handLandmarker = HandLandmarker.createFromOptions(context, options)
    }

    fun process(imageProxy: ImageProxy) {
        val mediaImage = imageProxy.image ?: return
        val image = MediaImageBuilder(mediaImage).build()
        val processingOptions = ImageProcessingOptions.builder()
            .setRotationDegrees(imageProxy.imageInfo.rotationDegrees)
            .build()
        handLandmarker.detectAsync(
            image,
            processingOptions,
            imageProxy.imageInfo.timestamp / 1_000_000L,
        )
    }

    fun close() {
        handLandmarker.close()
    }

    private fun handleResult(result: HandLandmarkerResult) {
        val landmarks = result.landmarks().firstOrNull() ?: return
        if (landmarks.size < 21) return

        val thumbTip = landmarks[4]
        val indexTip = landmarks[8]
        val pinchDistance = hypot(
            thumbTip.x() - indexTip.x(),
            thumbTip.y() - indexTip.y(),
        )
        if (pinchDistance < PINCH_THRESHOLD) {
            onAction(GestureAction.PINCH)
            return
        }

        val palmX = landmarks[9].x()
        val lastX = previousPalmX
        previousPalmX = palmX
        if (lastX != null) {
            val delta = palmX - lastX
            if (delta > SWIPE_THRESHOLD) {
                onAction(GestureAction.SWIPE_RIGHT)
                return
            }
            if (delta < -SWIPE_THRESHOLD) {
                onAction(GestureAction.SWIPE_LEFT)
                return
            }
        }

        val fingerTips = listOf(8, 12, 16, 20)
        val fingerPips = listOf(6, 10, 14, 18)
        val extended = fingerTips.count { tip -> landmarks[tip].y() < landmarks[fingerPips[fingerTips.indexOf(tip)]].y() }
        when {
            extended >= 4 -> onAction(GestureAction.HOME)
            extended == 0 -> onAction(GestureAction.RECENTS)
        }
    }

    companion object {
        private const val MODEL_ASSET = "hand_landmarker.task"
        private const val PINCH_THRESHOLD = 0.08f
        private const val SWIPE_THRESHOLD = 0.12f
    }
}