/// <reference types="node" />
/// <reference types="request" />

import { Ora } from "ora";
import { CoreOptions } from "request";

declare namespace proload {
  type Options = Partial<{
    request: CoreOptions;
    spinner: Partial<{
      instance: Ora;
      progressPrefix: string;
      progressSuffix: string;
      successMessage: string;
    }>;
  }>;
}

declare function proload(uri: string, options: proload.Options): Promise<Buffer>;
declare function proload(
  uri: string,
  destFilePath: string,
  options: proload.Options
): Promise<Buffer>;

export = proload;
