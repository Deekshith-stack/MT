package com.trackermacros.app

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.activity.result.contract.ActivityResultContract
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZonedDateTime

@CapacitorPlugin(name = "TrackerMacrosHealth")
class TrackerMacrosHealthPlugin : Plugin() {

    private val scope = CoroutineScope(Dispatchers.Main)
    private val stepsPermission = HealthPermission.getReadPermission(StepsRecord::class)

    private fun getHealthConnectClient(): HealthConnectClient? {
        val ctx = context ?: return null
        val status = HealthConnectClient.getSdkStatus(ctx)
        return if (status == HealthConnectClient.SDK_AVAILABLE) {
            HealthConnectClient.getOrCreate(ctx)
        } else {
            null
        }
    }

    @PluginMethod
    fun checkAvailability(call: PluginCall) {
        val ctx = context
        if (ctx == null) {
            call.reject("Context is null")
            return
        }

        val status = HealthConnectClient.getSdkStatus(ctx)
        val result = JSObject()
        when (status) {
            HealthConnectClient.SDK_AVAILABLE -> {
                result.put("available", true)
                result.put("status", "AVAILABLE")
            }
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> {
                result.put("available", false)
                result.put("status", "UPDATE_REQUIRED")
                result.put("message", "Health Connect requires an update from the Play Store.")
            }
            else -> {
                result.put("available", false)
                result.put("status", "UNAVAILABLE")
                result.put("message", "Health Connect is not supported on this device.")
            }
        }
        call.resolve(result)
    }

    @PluginMethod
    fun checkPermissions(call: PluginCall) {
        val client = getHealthConnectClient()
        if (client == null) {
            val res = JSObject()
            res.put("granted", false)
            res.put("status", "UNAVAILABLE")
            call.resolve(res)
            return
        }

        scope.launch {
            try {
                val granted = withContext(Dispatchers.IO) {
                    val grantedPermissions = client.permissionController.getGrantedPermissions()
                    grantedPermissions.contains(stepsPermission)
                }
                val res = JSObject()
                res.put("granted", granted)
                call.resolve(res)
            } catch (e: Exception) {
                call.reject("Failed to check permissions: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun requestPermissions(call: PluginCall) {
        val client = getHealthConnectClient()
        if (client == null) {
            call.reject("Health Connect is not available on this device.")
            return
        }

        scope.launch {
            try {
                // Check if already granted
                val grantedPermissions = withContext(Dispatchers.IO) {
                    client.permissionController.getGrantedPermissions()
                }

                if (grantedPermissions.contains(stepsPermission)) {
                    val res = JSObject()
                    res.put("granted", true)
                    call.resolve(res)
                    return@launch
                }

                // In native Capacitor, launch permission contract via Activity
                val act = activity
                if (act != null) {
                    val contract = PermissionController.createRequestPermissionResultContract()
                    val intent = contract.createIntent(act, setOf(stepsPermission))
                    act.startActivity(intent)
                    
                    val res = JSObject()
                    res.put("requested", true)
                    res.put("message", "Health Connect permission flow opened.")
                    call.resolve(res)
                } else {
                    call.reject("Activity is null")
                }
            } catch (e: Exception) {
                call.reject("Error launching permission flow: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun getTodaySteps(call: PluginCall) {
        val client = getHealthConnectClient()
        if (client == null) {
            // Fallback or reject
            call.reject("Health Connect client is not available")
            return
        }

        scope.launch {
            try {
                val now = Instant.now()
                val zoneId = ZoneId.systemDefault()
                val startOfDay = LocalDate.now(zoneId).atStartOfDay(zoneId).toInstant()

                val aggregateResponse = withContext(Dispatchers.IO) {
                    client.aggregate(
                        AggregateRequest(
                            metrics = setOf(StepsRecord.COUNT_TOTAL),
                            timeRangeFilter = TimeRangeFilter.between(startOfDay, now)
                        )
                    )
                }

                val totalSteps = aggregateResponse[StepsRecord.COUNT_TOTAL] ?: 0L

                val result = JSObject()
                result.put("steps", totalSteps)
                result.put("timestamp", now.toString())
                result.put("source", "Health Connect (Aggregated)")
                call.resolve(result)
            } catch (e: Exception) {
                call.reject("Failed to aggregate steps: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun openHealthConnectSettings(call: PluginCall) {
        val act = activity ?: run {
            call.reject("Activity is null")
            return
        }

        try {
            val intent = Intent("androidx.health.ACTION_HEALTH_CONNECT_SETTINGS")
            act.startActivity(intent)
            call.resolve()
        } catch (e: Exception) {
            // Fallback to application settings or Play Store
            try {
                val intent = Intent(Intent.ACTION_VIEW).apply {
                    data = Uri.parse("market://details?id=com.google.android.apps.healthdata")
                }
                act.startActivity(intent)
                call.resolve()
            } catch (ex: Exception) {
                call.reject("Unable to open Health Connect settings: ${ex.message}")
            }
        }
    }
}
