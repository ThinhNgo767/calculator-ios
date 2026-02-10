const DeviceFingerprint = {
  getRawFingerprint: () => {
    const info = [
      navigator.userAgent,
      navigator.language,
      window.screen.width + "x" + window.screen.height,
      window.screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency,
      (() => {
        try {
          const canvas = document.createElement("canvas");
          const gl = canvas.getContext("webgl");
          const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
          return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        } catch (e) {
          return "no-gpu";
        }
      })(),
    ];
    return info.join("|");
  },

  cyrb53: (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed,
      h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 =
      Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
      Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 =
      Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
      Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (
      (h2 >>> 0).toString(16).padEnd(8, "0") +
      (h1 >>> 0).toString(16).padEnd(8, "0")
    );
  },

  getDeviceID: function () {
    // Sử dụng function thường hoặc gọi DeviceFingerprint trực tiếp
    const storageKey = "calculator_device_id";
    let id = localStorage.getItem(storageKey);

    if (!id) {
      // Gọi thông qua tên Object để an toàn nhất
      const raw = DeviceFingerprint.getRawFingerprint();
      id = DeviceFingerprint.cyrb53(raw).substring(0, 12);
      localStorage.setItem(storageKey, id);
    }
    return id;
  },
};

export default DeviceFingerprint;
