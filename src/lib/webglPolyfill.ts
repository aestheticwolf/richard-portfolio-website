/**
 * WebGL 2.0 Specification Compliance Guard:
 * According to WebGL 2 Section 3.7.6, UNPACK_FLIP_Y_WEBGL and UNPACK_PREMULTIPLY_ALPHA_WEBGL
 * are forbidden for non-DOM / TypedArray buffer uploads via texImage3D.
 * When Three.js uploads 2D textures, it leaves UNPACK_FLIP_Y_WEBGL active in the WebGL state.
 * When Three.js subsequently initializes empty 3D textures during WebGLState creation,
 * the active FLIP_Y state causes Chromium/ANGLE to log an INVALID_OPERATION warning.
 *
 * This guard ensures that whenever texImage3D is invoked, unpack flipY and premultiplyAlpha
 * parameters are safely cleared to false for the duration of the 3D texture upload.
 */
if (typeof window !== 'undefined' && typeof HTMLCanvasElement !== 'undefined') {
  const origGetContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextId: string,
    options?: unknown
  ) {
    const ctx = (origGetContext as (type: string, opts?: unknown) => RenderingContext | null).call(
      this,
      contextId,
      options
    )

    if (ctx && (contextId === 'webgl2' || contextId === 'webgl')) {
      const gl = ctx as WebGL2RenderingContext
      if (typeof gl.texImage3D === 'function' && !(gl as unknown as { __tex3dGuarded?: boolean }).__tex3dGuarded) {
        ;(gl as unknown as { __tex3dGuarded: boolean }).__tex3dGuarded = true
        const origTexImage3D = gl.texImage3D

        gl.texImage3D = function (this: WebGL2RenderingContext, ...args: unknown[]) {
          const flipY = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL) as boolean
          const premult = gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL) as boolean

          if (flipY) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
          if (premult) gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)

          try {
            return (origTexImage3D as (...a: unknown[]) => unknown).apply(this, args)
          } finally {
            if (flipY) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
            if (premult) gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
          }
        } as typeof gl.texImage3D
      }
    }

    return ctx
  } as typeof HTMLCanvasElement.prototype.getContext
}

export {}
