package com.mitu.assistant.native

class UsageLimitException(message: String) : IllegalStateException(message)

class UsageRepository(
    private val api: MituApiClient,
    private val userId: String,
) {
    suspend fun recordAction(actionType: String): MituUsageStatus {
        val status = api.recordUsage(userId, actionType)
        if (!status.allowed) {
            throw UsageLimitException("The ${actionType} limit has been reached for this account.")
        }
        return status
    }

    suspend fun remoteConfig(): MituRemoteConfig = api.remoteConfig()
}