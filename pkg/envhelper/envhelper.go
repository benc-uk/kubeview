package envhelper

import _ "github.com/joho/godotenv/autoload" // Autoload .env file
import "os"
import "strconv"

// A simple helper function to read an environment or return a default value.
func getEnv(key string, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}

// GetEnvString is simple helper function to read an environment or return a default value.
func GetEnvString(key string, defaultVal string) string {
	return getEnv(key, defaultVal)
}

// GetEnvInt is simple helper function to read an environment or return a default value.
func GetEnvInt(key string, defaultVal int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultVal
}

// GetEnvBool is simple helper function to read an environment or return a default value.
func GetEnvBool(key string, defaultVal bool) bool {
	valueStr := getEnv(key, "")
	if value, err := strconv.ParseBool(valueStr); err == nil {
		return value
	}
	return defaultVal
}