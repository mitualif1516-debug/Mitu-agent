package com.mitu.assistant.native

import com.mitu.assistant.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

data class MituRemoteConfig(
    val freeDailyActionLimit: Int,
    val freeLockScreenLimit: Int,
    val gesturesEnabled: Boolean,
    val translationEnabled: Boolean,
    val autoSendEnabled: Boolean,
)

data class MituUsageStatus(
    val allowed: Boolean,
    val plan: String,
    val used: Int,
    val limit: Int,
    val remaining: Int,
)

data class MituTranslationResult(
    val text: String,
    val sourceLanguage: String,
    val targetLanguage: String,
    val provider: String,
)

class MituApiClient(
    private val httpClient: OkHttpClient = OkHttpClient(),
    private val baseUrl: String = BuildConfig.MITU_API_BASE_URL,
    private val bearerTokenProvider: () -> String? = { null },
) {
    suspend fun remoteConfig(): MituRemoteConfig = withContext(Dispatchers.IO) {
        val json = get("/api/remote-config")
        MituRemoteConfig(
            freeDailyActionLimit = json.getInt("freeDailyActionLimit"),
            freeLockScreenLimit = json.getInt("freeLockScreenLimit"),
            gesturesEnabled = json.getBoolean("gesturesEnabled"),
            translationEnabled = json.getBoolean("translationEnabled"),
            autoSendEnabled = json.getBoolean("autoSendEnabled"),
        )
    }

    suspend fun recordUsage(userId: String, actionType: String): MituUsageStatus =
        withContext(Dispatchers.IO) {
            val body = JSONObject()
                .put("userId", userId)
                .put("actionType", actionType)
                .toString()
                .toRequestBody(JSON_MEDIA_TYPE)
            val json = execute(
                Request.Builder()
                    .url(url("/api/mobile/usage"))
                    .post(body)
                    .build(),
            )
            MituUsageStatus(
                allowed = json.getBoolean("allowed"),
                plan = json.getString("plan"),
                used = json.getInt("used"),
                limit = json.getInt("limit"),
                remaining = json.getInt("remaining"),
            )
        }

    suspend fun translate(
        text: String,
        sourceLanguage: String,
        targetLanguage: String,
    ): MituTranslationResult = withContext(Dispatchers.IO) {
        val body = JSONObject()
            .put("text", text)
            .put("sourceLanguage", sourceLanguage)
            .put("targetLanguage", targetLanguage)
            .toString()
            .toRequestBody(JSON_MEDIA_TYPE)
        val json = execute(
            Request.Builder()
                .url(url("/api/mobile/translate"))
                .post(body)
                .build(),
        )
        MituTranslationResult(
            text = json.getString("text"),
            sourceLanguage = json.getString("sourceLanguage"),
            targetLanguage = json.getString("targetLanguage"),
            provider = json.getString("provider"),
        )
    }

    private fun get(path: String): JSONObject =
        execute(Request.Builder().url(url(path)).get().build())

    private fun execute(request: Request): JSONObject {
        val authenticatedRequest = request.newBuilder().apply {
            bearerTokenProvider()?.takeIf(String::isNotBlank)?.let {
                header("Authorization", "Bearer $it")
            }
            header("Accept", "application/json")
        }.build()
        httpClient.newCall(authenticatedRequest).execute().use { response ->
            val payload = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IllegalStateException("Mitu API ${response.code}: ${payload.take(300)}")
            }
            return JSONObject(payload)
        }
    }

    private fun url(path: String): String =
        "${baseUrl.trimEnd('/')}/${path.trimStart('/')}"

    companion object {
        private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaType()
    }
}