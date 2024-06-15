import { Transform, TransformCallback } from "stream";

export class DecodeMessageStream extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    const decodeContent = Buffer.from(chunk.content, "base64url").toString(
      "utf-8"
    );
    chunk.content = decodeContent;
    this.push(JSON.stringify(chunk));
    callback();
  }
}

export class JsonArrayStream extends Transform {
  jsonArray: any[];
  constructor() {
    super({ readableObjectMode: true, writableObjectMode: true });
    this.jsonArray = [];
  }

  _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    this.jsonArray.push(JSON.parse(chunk));
    callback();
  }

  _flush(callback: TransformCallback): void {
    this.push(JSON.stringify(this.jsonArray));
    callback();
  }
}
