import { TextDocument } from "vscode";

export class DocUtil {
  static isSchema(document: TextDocument) {
    return document.uri.fsPath.endsWith(".schema.yml");
  }
}
