// ==========================================================================================
// Server configuration via environment variables
// ==========================================================================================

package main

import (
	"os"
	"strconv"
)

// Config holds the configuration for the system
type Config struct {
	Port            int
	NameSpaceFilter string
	SingleNamespace string
	Debug           bool
	EnablePodLogs   bool
}

// Parse the environment variables and return a Config struct
// Also provides default values if the environment variables are not set
func getConfig() Config {
	// Default values
	port := 8000
	nameSpaceFilter := ""
	singleNamespace := ""
	debug := false
	enablePodLogs := true

	if portEnv := os.Getenv("PORT"); portEnv != "" {
		if p, err := strconv.Atoi(portEnv); err == nil {
			port = p
		}
	}

	if s := os.Getenv("SINGLE_NAMESPACE"); s != "" {
		singleNamespace = s
	}

	if s := os.Getenv("NAMESPACE_FILTER"); s != "" {
		nameSpaceFilter = s
	}

	if s := os.Getenv("DISABLE_POD_LOGS"); s != "" {
		if enable, err := strconv.ParseBool(s); err == nil {
			enablePodLogs = !enable
		}
	}

	if debugEnv := os.Getenv("DEBUG"); debugEnv != "" {
		debug, _ = strconv.ParseBool(debugEnv)
	}

	return Config{
		Port:            port,
		NameSpaceFilter: nameSpaceFilter,
		SingleNamespace: singleNamespace,
		Debug:           debug,
		EnablePodLogs:   enablePodLogs,
	}
}
