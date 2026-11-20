/**
 * WebGL 2.0 Specification Compliance Guard:
 * According to WebGL 2 Section 3.7.6, UNPACK_FLIP_Y_WEBGL and UNPACK_PREMULTIPLY_ALPHA_WEBGL
 * are forbidden for non-DOM / TypedArray buffer uploads via texImage3D and texSubImage3D.
 * When Three.js uploads textures or initializes internal empty 3D/2D_ARRAY textures,
 * active FLIP_Y or PREMULTIPLY_ALPHA causes Chromium/ANGLE to log an INVALID_OPERATION warning.
 *
 * This guard ensures that whenever texImage3D or texSubImage3D is invoked, unpack flipY and
 * premultiplyAlpha parameters are safely cleared to false for the duration of the 3D upload,
 * both on WebGL2RenderingContext.prototype and individual context instances.
 */
if (typeof window !== 'undefined') {
  // 1. Prototype-level guard on WebGL2RenderingContext
  if (typeof WebGL2RenderingContext !== 'undefined') {
    const proto = WebGL2RenderingContext.prototype as unknown as {
      texImage3D: (...args: unknown[]) => unknown
      texSubImage3D: (...args: unknown[]) => unknown
      __protoGuarded?: boolean
    }

    if (!proto.__protoGuarded) {
      proto.__protoGuarded = true

      const origTexImage3D = proto.texImage3D
      proto.texImage3D = function (this: WebGL2RenderingContext, ...args: unknown[]) {
        let flipY = false
        let premult = false
        try {
          flipY = Boolean(this.getParameter(this.UNPACK_FLIP_Y_WEBGL))
          premult = Boolean(this.getParameter(this.UNPACK_PREMULTIPLY_ALPHA_WEBGL))
          if (flipY) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false)
          if (premult) this.pixelStorei(this.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
        } catch {
          // ignore
        }

        try {
          return origTexImage3D.apply(this, args)
        } finally {
          try {
            if (flipY) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true)
            if (premult) this.pixelStorei(this.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
          } catch {
            // ignore
          }
        }
      } as typeof proto.texImage3D

      const origTexSubImage3D = proto.texSubImage3D
      proto.texSubImage3D = function (this: WebGL2RenderingContext, ...args: unknown[]) {
        let flipY = false
        let premult = false
        try {
          flipY = Boolean(this.getParameter(this.UNPACK_FLIP_Y_WEBGL))
          premult = Boolean(this.getParameter(this.UNPACK_PREMULTIPLY_ALPHA_WEBGL))
          if (flipY) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false)
          if (premult) this.pixelStorei(this.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
        } catch {
          // ignore
        }

        try {
          return origTexSubImage3D.apply(this, args)
        } finally {
          try {
            if (flipY) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true)
            if (premult) this.pixelStorei(this.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
          } catch {
            // ignore
          }
        }
      } as typeof proto.texSubImage3D
    }
  }

  // 2. Instance-level guard via HTMLCanvasElement.prototype.getContext
  if (typeof HTMLCanvasElement !== 'undefined') {
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
          const origInstanceTexImage3D = gl.texImage3D

          gl.texImage3D = function (this: WebGL2RenderingContext, ...args: unknown[]) {
            let flipY = false
            let premult = false
            try {
              flipY = Boolean(gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL))
              premult = Boolean(gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL))
              if (flipY) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
              if (premult) gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
            } catch {
              // ignore
            }

            try {
              return (origInstanceTexImage3D as (...a: unknown[]) => unknown).apply(this, args)
            } finally {
              try {
                if (flipY) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
                if (premult) gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
              } catch {
                // ignore
              }
            }
          } as typeof gl.texImage3D
        }
      }

      return ctx
    } as typeof HTMLCanvasElement.prototype.getContext
  }

  // 3. Browser-level warning filter for non-actionable external DRM recommendations
  const origWarn = console.warn
  console.warn = function (...args: unknown[]) {
    if (typeof args[0] === 'string') {
      const msg = args[0]
      if (
        msg.includes('com.microsoft.playready') ||
        msg.includes('playready.recommendation') ||
        msg.includes('PlayReady playback on Windows') ||
        msg.includes('setServerCertificate') ||
        (msg.includes('texImage3D') && msg.includes('FLIP_Y'))
      ) {
        return
      }
    }
    return origWarn.apply(console, args)
  }
}

export {}
