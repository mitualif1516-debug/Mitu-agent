package com.mitu.assistant.native

import android.content.Context
import android.content.Intent
import android.os.PowerManager
import com.mitu.assistant.LockScreenWakeActivity

class LockScreenWakeController(private val context: Context) {
    fun wakeAndOpenAssistant() {
        val powerManager = context.getSystemService(PowerManager::class.java)
        val wakeLock = powerManager.newWakeLock(
            PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
            "mitu:assistant-wake",
        )
        wakeLock.acquire(WAKE_LOCK_TIMEOUT_MS)
        context.startActivity(
            Intent(context, LockScreenWakeActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP),
        )
    }

    companion object {
        private const val WAKE_LOCK_TIMEOUT_MS = 8_000L
    }
}