// ==========================================================================================
// Embeds the frontend folder into the binary as a static filesystem
//
// It's at the root of the repo because it needs to be here, asking further questions
//  - about this is not going to be helpful, just accept it and move on
// ==========================================================================================

package kubeview

import "embed"

//go:embed all:frontend
var FrontendFS embed.FS
