<?php
// api.php - REST API mit internationaler Provider-Datenbank
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Internationale Provider-Datenbank
function getGlobalProviders() {
    static $providers = null;
    
    // Cache im Speicher behalten für bessere Performance
    if ($providers !== null) {
        return $providers;
    }
    
    $providersFile = __DIR__ . './providers_array.php';
    
    if (!file_exists($providersFile)) {
        // Fallback: Leeres Array zurückgeben
        error_log("Provider-Datei nicht gefunden: " . $providersFile);
        $providers = [];
        return $providers;
    }
    
    // Datei einbinden und das Array holen
    $providers = include $providersFile;
    
    // Sicherstellen, dass wir ein Array zurückgeben
    if (!is_array($providers)) {
        error_log("Provider-Datei enthält kein gültiges Array.");
        $providers = [];
    }
    
    return $providers;
}

// Verbesserte Provider-Erkennung
function detectProvider($ip) {
    // 1. Lokale globale Datenbank prüfen
    $providers = getGlobalProviders();
    foreach ($providers as $prefix => $info) {
        if (strpos($ip, $prefix) === 0) {
            $info['source'] = 'local_database';
            return $info;
        }
    }
    
    // 2. Externe API als Fallback (mit spezieller Behandlung für bekannte Provider)
    return detectProviderByExternalAPI($ip);
}

// Verbesserte externe Provider-Erkennung
function detectProviderByExternalAPI($ip) {
    // Nur öffentliche IPs
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE) === false) {
        return [
            'name' => 'Privates Netzwerk',
            'asn' => null,
            'country' => null,
            'type' => 'Private',
            'source' => 'private_network'
        ];
    }
    
    $url = "http://ip-api.com/json/{$ip}?fields=status,isp,org,as,asname,country,countryCode,query";
    
    $context = stream_context_create(['http' => ['timeout' => 3]]);
    $response = @file_get_contents($url, false, $context);
    
    if ($response) {
        $data = json_decode($response, true);
        
        if ($data['status'] === 'success') {
            $asn = null;
            if (!empty($data['as'])) {
                preg_match('/AS(\d+)/', $data['as'], $matches);
                $asn = $matches[0] ?? null;
            }
            
            // Spezielle Behandlung für französische Provider
            if ($data['countryCode'] === 'FR') {
                // Orange erkennen
                if (stripos($data['isp'], 'Orange') !== false || 
                    stripos($data['org'], 'Orange') !== false ||
                    stripos($data['asname'], 'Orange') !== false) {
                    return [
                        'name' => 'Orange S.A.',
                        'asn' => $asn,
                        'organization' => $data['org'] ?? 'Orange S.A.',
                        'country' => 'FR',
                        'type' => 'ISP',
                        'website' => 'https://www.orange.fr',
                        'source' => 'ip-api.com (enhanced)'
                    ];
                }
                
                // Free erkennen
                if (stripos($data['isp'], 'Free') !== false || 
                    stripos($data['org'], 'Free') !== false ||
                    stripos($data['asname'], 'Free') !== false ||
                    stripos($data['isp'], 'Iliad') !== false) {
                    return [
                        'name' => 'Free (Iliad)',
                        'asn' => $asn,
                        'organization' => $data['org'] ?? 'Free SAS',
                        'country' => 'FR',
                        'type' => 'ISP',
                        'website' => 'https://www.free.fr',
                        'source' => 'ip-api.com (enhanced)'
                    ];
                }
                
                // SFR erkennen
                if (stripos($data['isp'], 'SFR') !== false || 
                    stripos($data['org'], 'SFR') !== false ||
                    stripos($data['asname'], 'SFR') !== false) {
                    return [
                        'name' => 'SFR',
                        'asn' => $asn,
                        'organization' => $data['org'] ?? 'SFR',
                        'country' => 'FR',
                        'type' => 'ISP',
                        'website' => 'https://www.sfr.fr',
                        'source' => 'ip-api.com (enhanced)'
                    ];
                }
                
                // Bouygues erkennen
                if (stripos($data['isp'], 'Bouygues') !== false || 
                    stripos($data['org'], 'Bouygues') !== false) {
                    return [
                        'name' => 'Bouygues Telecom',
                        'asn' => $asn,
                        'organization' => $data['org'] ?? 'Bouygues Telecom',
                        'country' => 'FR',
                        'type' => 'ISP',
                        'website' => 'https://www.bouyguestelecom.fr',
                        'source' => 'ip-api.com (enhanced)'
                    ];
                }
            }
            
            // Allgemeine Rückgabe für andere Provider
            return [
                'asn' => $asn,
                'name' => $data['isp'] ?? $data['org'] ?? 'Unbekannter Provider',
                'organization' => $data['org'] ?? null,
                'as_name' => $data['asname'] ?? null,
                'country' => $data['countryCode'] ?? null,
                'source' => 'ip-api.com'
            ];
        }
    }
    
    return null;
}

// Geodaten (kostenlos über ip-api.com)
function getGeolocation($ip) {
    // Nur öffentliche IPs
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE) === false) {
        return [
            'note' => 'Private IP address',
            'is_private' => true
        ];
    }
    
    $url = "http://ip-api.com/json/{$ip}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting,mobile,query";
    
    $context = stream_context_create(['http' => ['timeout' => 3]]);
    $response = @file_get_contents($url, false, $context);
    
    if ($response) {
        $data = json_decode($response, true);
        if ($data['status'] === 'success') {
            return [
                'country' => $data['country'],
                'country_code' => $data['countryCode'],
                'region' => $data['regionName'],
                'city' => $data['city'],
                'zip' => $data['zip'],
                'latitude' => $data['lat'],
                'longitude' => $data['lon'],
                'timezone' => $data['timezone'],
                'isp' => $data['isp'],
                'organization' => $data['org'],
                'as_number' => $data['as'],
                'proxy' => $data['proxy'] ?? false,
                'hosting' => $data['hosting'] ?? false,
                'mobile' => $data['mobile'] ?? false,
                'source' => 'ip-api.com'
            ];
        }
    }
    
    return null;
}

// Client IP ermitteln (mit Proxy-Support)
function getClientIP() {
    $ip_keys = [
        'HTTP_CLIENT_IP',
        'HTTP_X_FORWARDED_FOR', 
        'HTTP_X_FORWARDED',
        'HTTP_X_CLUSTER_CLIENT_IP',
        'HTTP_FORWARDED_FOR',
        'HTTP_FORWARDED',
        'REMOTE_ADDR'
    ];
    
    foreach ($ip_keys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP) !== false) {
                    return $ip;
                }
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// Hauptlogik
try {
    $client_ip = getClientIP();
    $provider_info = detectProvider($client_ip);
    $geo_data = getGeolocation($client_ip);
    
    // Response
    $response = [
        'success' => true,
        'api' => [
            'name' => 'IP Information API',
            'version' => '3.0',
            'endpoint' => $_SERVER['REQUEST_URI'] ?? '/api.php',
            'documentation' => 'Add ?details=true for extended info',
            'features' => ['International provider detection', 'Geolocation', 'Proxy detection']
        ],
        
        'request' => [
            'timestamp' => date('c'),
            'timestamp_unix' => time(),
            'method' => $_SERVER['REQUEST_METHOD']
        ],
        
        'ip' => [
            'address' => $client_ip,
            'type' => filter_var($client_ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) ? 'IPv6' : 'IPv4',
            'version' => filter_var($client_ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) ? 6 : 4,
            'is_private' => filter_var($client_ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE) === false,
            'is_public' => filter_var($client_ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE) !== false
        ],
        
        'network' => [
            'protocol' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http',
            'host' => $_SERVER['HTTP_HOST'] ?? 'localhost',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'accept_language' => $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? null
        ]
    ];
    
    // Provider hinzufügen (falls vorhanden)
    if ($provider_info) {
        $response['provider'] = [
            'name' => $provider_info['name'] ?? 'Unbekannter Provider',
            'asn' => $provider_info['asn'] ?? null,
            'country' => $provider_info['country'] ?? null,
            'type' => $provider_info['type'] ?? 'Unknown',
            'source' => $provider_info['source'] ?? 'unknown'
        ];
        
        // Zusätzliche Felder wenn vorhanden
        if (isset($provider_info['organization'])) {
            $response['provider']['organization'] = $provider_info['organization'];
        }
        if (isset($provider_info['as_name'])) {
            $response['provider']['as_name'] = $provider_info['as_name'];
        }
        if (isset($provider_info['website'])) {
            $response['provider']['website'] = $provider_info['website'];
        }
    } else {
        // Auch wenn kein Provider gefunden wurde, zeigen wir das an
        $response['provider'] = [
            'name' => 'Keine Provider-Information verfügbar',
            'note' => 'Provider nicht in der lokalen Datenbank und externe API nicht erreichbar',
            'source' => 'none'
        ];
    }
    
    // Geodaten hinzufügen
    if ($geo_data) {
        $response['geolocation'] = $geo_data;
        
        // Falls Geodaten einen ISP enthalten, diesen als Fallback für Provider verwenden
        if (!isset($response['provider']['name']) || $response['provider']['name'] === 'Keine Provider-Information verfügbar') {
            if (isset($geo_data['isp']) && $geo_data['isp']) {
                $response['provider'] = [
                    'name' => $geo_data['isp'],
                    'organization' => $geo_data['organization'] ?? null,
                    'as_number' => $geo_data['as_number'] ?? null,
                    'country' => $geo_data['country_code'] ?? null,
                    'source' => 'geolocation_fallback'
                ];
            }
        }
    }
    
    // Proxy-Erkennung
    $proxy_headers = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_VIA', 'HTTP_FORWARDED'];
    $proxy_detected = false;
    $proxy_details = [];
    
    foreach ($proxy_headers as $header) {
        if (!empty($_SERVER[$header])) {
            $proxy_detected = true;
            $proxy_details[$header] = $_SERVER[$header];
        }
    }
    
    if ($proxy_detected) {
        $response['proxy'] = [
            'detected' => true,
            'headers' => $proxy_details
        ];
    }
    
    // Extended Details
    if (isset($_GET['details']) && $_GET['details'] === 'true') {
        $response['extended'] = [
            'server' => [
                'software' => $_SERVER['SERVER_SOFTWARE'] ?? null,
                'address' => $_SERVER['SERVER_ADDR'] ?? null,
                'port' => $_SERVER['SERVER_PORT'] ?? null
            ],
            'client' => [
                'port' => $_SERVER['REMOTE_PORT'] ?? null,
                'forwarded_for' => $_SERVER['HTTP_X_FORWARDED_FOR'] ?? null,
                'real_ip' => $_SERVER['HTTP_X_REAL_IP'] ?? null
            ],
            'debug' => [
                'ip_detected_as' => $client_ip,
                'provider_detection_method' => $provider_info['source'] ?? 'none',
                'provider_name_raw' => $provider_info['name'] ?? 'none'
            ]
        ];
    }
    
    // JSON ausgeben
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal Server Error',
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>