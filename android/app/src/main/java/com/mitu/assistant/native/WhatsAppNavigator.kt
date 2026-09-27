package com.mitu.assistant.native

import android.content.Context
import android.content.Intent
import android.net.Uri

class WhatsAppNavigator(private val context: Context) {
    fun openChat(phoneNumber: String): Boolean {
        val normalized = phoneNumber.filter(Char::isDigit)
        if (normalized.isEmpty()) return false
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/$normalized"))
            .setPackage("com.whatsapp")
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        return runCatching {
            context.startActivity(intent)
            true
        }.getOrDefault(false)
    }
}