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
}

// Parse the environment variables and return a Config struct
// Also provides default values if the environment variables are not set
func getConfig() Config {
	// Default values
	port := 8000
	nameSpaceFilter := ""
	singleNamespace := ""

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

	return Config{
		Port:            port,
		NameSpaceFilter: nameSpaceFilter,
		SingleNamespace: singleNamespace,
	}
}
