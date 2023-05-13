export const customLog = {
  bool: false,
  log: function (...m: any) {
    if (this.bool) {
      console.log(...m);
    }
  },
};
