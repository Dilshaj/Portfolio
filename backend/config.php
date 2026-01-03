<?php
// backend/config.php

// SMTP Configuration
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_USERNAME', 'dilshajinfotech.it@gmail.com');
define('SMTP_PASSWORD', 'gwgqrgtjekiljkiy'); // App Password
define('SMTP_PORT', 587);
define('SMTP_FROM_EMAIL', 'dilshajinfotech.it@gmail.com');
define('SMTP_FROM_NAME', 'Dilshaj Infotech');

// Error Reporting Config (Set to 0 for production, 1 for debugging)
define('DEBUG_MODE', 0); 

if (DEBUG_MODE) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(0);
}
?>
