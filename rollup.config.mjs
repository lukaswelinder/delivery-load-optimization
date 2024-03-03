import esbuild from 'rollup-plugin-esbuild';

export default {
  plugins: [esbuild()],
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
  },
};
