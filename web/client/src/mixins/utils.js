//
// UTILS MIXIN SERVICE
// Helpers and util methods
//

export default {
  methods: {
    //
    // Calculate the hash of a string, used for creating node ids
    //
    utilsHashStr(s) {
      let hash = 0,
        i,
        chr
      if (s.length === 0) {
        return hash
      }
      for (i = 0; i < s.length; i++) {
        chr = s.charCodeAt(i)
        hash = (hash << 5) - hash + chr
        hash |= 0 // Convert to 32bit integer
      }
      return hash
    },

    //
    // I got tired of checking if multiple nested properties existed in objects
    //
    utilsCheckNested(obj /*, level1, level2, ... levelN*/) {
      let args = Array.prototype.slice.call(arguments, 1)

      for (let i = 0; i < args.length; i++) {
        if (!obj || !Object.prototype.hasOwnProperty.call(obj, args[i])) {
          return false
        }
        obj = obj[args[i]]
      }

      return true
    },

    //
    // Date formatting, always a hoot
    //
    utilsDateFromISO8601(isostr) {
      let parts = isostr.match(/\d+/g)
      return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5])
    },
  },
}
