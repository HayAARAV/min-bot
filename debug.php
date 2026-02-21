
<?php
/**
 * GYK Mining Bot Debug Utility
 * Timezone: GMT (UTC)
 */

header('Content-Type: text/plain');
date_default_timezone_set('UTC');

echo "--- SYSTEM DEBUG INFO ---\n";
echo "Current Time (GMT): " . date('Y-m-d H:i:s') . "\n";
echo "PHP Version: " . phpversion() . "\n";

// 1. Database Connectivity Check (Placeholder)
$dbStatus = "GREEN"; // Simulation
echo "DB Connection: [" . $dbStatus . "] (Simulated)\n";

// 2. Environment Variables
$botToken = getenv('TELEGRAM_BOT_TOKEN') ?: 'xxxyyyzzz';
$adsToken = getenv('ADSGRAM_TOKEN') ?: '9089b9fa76cc45a7abc5f329f8d7aaff';

echo "Telegram Token: " . ($botToken ? "[SET]" : "[MISSING]") . "\n";
echo "Adsgram Token: " . ($adsToken ? "[SET]" : "[MISSING]") . "\n";

// 3. Session Check
session_start();
echo "Session Status: [" . (session_id() ? "ACTIVE" : "INACTIVE") . "]\n";
echo "Session ID: " . session_id() . "\n";

// 4. Client Info
echo "Client IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN') . "\n";
echo "User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'UNKNOWN') . "\n";

echo "\n--- END DEBUG ---\n";
?>
