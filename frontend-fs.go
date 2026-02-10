// ==========================================================================================
// Embeds the frontend folder into the binary as a static filesystem
// It's at the root of the repo because it needs to here.
// ==========================================================================================

package kubeview

import "embed"

//go:embed all:frontend
var FrontendFS embed.FS
