package com.mitu.assistant

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.mitu.assistant.databinding.ActivityMainBinding
import com.mitu.assistant.native.MituAccessibilityService
import com.mitu.assistant.native.MituForegroundService

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions(),
    ) {
        updateReadiness()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.toggleAssistantButton.setOnClickListener {
            requestPermissionsAndStart()
        }
        binding.accessibilityButton.setOnClickListener {
            startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
        }
        updateReadiness()
    }

    override fun onResume() {
        super.onResume()
        if (::binding.isInitialized) updateReadiness()
    }

    private fun requestPermissionsAndStart() {
        val missing = requiredRuntimePermissions().filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            permissionLauncher.launch(missing.toTypedArray())
            return
        }
        ContextCompat.startForegroundService(
            this,
            Intent(this, MituForegroundService::class.java).setAction(MituForegroundService.ACTION_START),
        )
        binding.statusText.text = getString(R.string.foreground_service_notification)
    }

    private fun requiredRuntimePermissions(): List<String> {
        val permissions = mutableListOf(
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO,
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions += Manifest.permission.POST_NOTIFICATIONS
        }
        return permissions
    }

    private fun updateReadiness() {
        if (!::binding.isInitialized) return
        val camera = permissionState(Manifest.permission.CAMERA)
        val microphone = permissionState(Manifest.permission.RECORD_AUDIO)
        val accessibility = if (MituAccessibilityService.isEnabled(this)) "enabled" else "permission needed"
        binding.readinessText.text = buildString {
            appendLine("Camera: $camera")
            appendLine("Microphone: $microphone")
            appendLine("AccessibilityService: $accessibility")
            append("Wake word: fixed to “Mitu” / “মিতু”")
        }
    }

    private fun permissionState(permission: String): String =
        if (ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED) {
            "ready"
        } else {
            "permission needed"
        }
}