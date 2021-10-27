import _ from "lodash";
import { Logger } from "../logger";
import vscode from "vscode";
import { SchemaParser } from "@dendronhq/engine-server";
import { getDWorkspace, getVaultFromUri } from "../workspace";
import path from "path";

let SCHEMA_SYNC_SERVICE: SchemaSyncService | undefined;

/** Currently responsible for keeping the engine in sync with schema
 *  changes on disk. */
export class SchemaSyncService {
  static instance() {
    if (_.isUndefined(SCHEMA_SYNC_SERVICE)) {
      SCHEMA_SYNC_SERVICE = new SchemaSyncService();
    }
    return SCHEMA_SYNC_SERVICE;
  }

  async onDidSave({ document }: { document: vscode.TextDocument }) {
    Logger.info({
      ctx: "SchemaSyncService:onDidChange",
      msg: "updating schema.",
    });

    const schemaParser = new SchemaParser({
      wsRoot: getDWorkspace().wsRoot,
      logger: Logger,
    });
    const uri = document.uri;
    const engineClient = getDWorkspace().engine;

    const parsedSchema = await schemaParser.parse(
      [path.basename(uri.fsPath)],
      getVaultFromUri(uri)
    );

    await Promise.all(
      _.map(parsedSchema.schemas, async (schema) => {
        await engineClient.updateSchema(schema);
      })
    );
  }
}
