import "dotenv/config";
import "~commands";
import "~modules";

import { Glaggler } from "./client";
import { installYTDLP } from "./modules/ytdlp";

installYTDLP();
Glaggler.connect();
