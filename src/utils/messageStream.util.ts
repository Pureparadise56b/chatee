import { Transform, TransformCallback, TransformOptions } from "stream";

export class DecodeMessageStream extends Transform {
  constructor(options: TransformOptions) {
    super(options);
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
    this.push(chunk);
    callback();
  }
}
