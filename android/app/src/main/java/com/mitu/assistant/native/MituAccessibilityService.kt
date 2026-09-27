package com.mitu.assistant.native

import android.accessibilityservice.AccessibilityService
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import java.util.concurrent.atomic.AtomicReference

class MituAccessibilityService : AccessibilityService() {
    private val dispatcher = ActionDispatcher()

    override fun onServiceConnected() {
        super.onServiceConnected()
        current.set(this)
    }

    override fun onDestroy() {
        if (current.get() === this) current.set(null)
        super.onDestroy()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // The active package is deliberately observed only while the service
        // is enabled; no screen contents are uploaded by this service.
        activePackage = event?.packageName?.toString()
    }

    override fun onInterrupt() = Unit

    fun dispatch(action: GestureAction): Boolean = dispatcher.dispatch(action, this)

    fun openWhatsAppChat(phoneNumber: String): Boolean {
        val normalized = phoneNumber.filter(Char::isDigit)
        if (normalized.isEmpty()) return false
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/$normalized"))
            .setPackage(WHATSAPP_PACKAGE)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        return runCatching {
            startActivity(intent)
            true
        }.getOrDefault(false)
    }

    fun clickVisibleText(text: String): Boolean {
        val root = rootInActiveWindow ?: return false
        return findNode(root, text)?.performAction(AccessibilityNodeInfo.ACTION_CLICK) == true
    }

    private fun findNode(root: AccessibilityNodeInfo, text: String): AccessibilityNodeInfo? {
        root.findAccessibilityNodeInfosByText(text).firstOrNull()?.let { return it }
        for (index in 0 until root.childCount) {
            root.getChild(index)?.let { child ->
                findNode(child, text)?.let { return it }
            }
        }
        return null
    }

    companion object {
        private const val WHATSAPP_PACKAGE = "com.whatsapp"
        private val current = AtomicReference<MituAccessibilityService?>()
        @Volatile private var activePackage: String? = null

        fun instance(): MituAccessibilityService? = current.get()

        fun isEnabled(context: Context): Boolean {
            val expected = ComponentName(context, MituAccessibilityService::class.java).flattenToString()
            val enabled = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
            ) ?: return false
            return enabled.split(':').any { it.equals(expected, ignoreCase = true) }
        }
    }
}