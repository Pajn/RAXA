const gulp = require('gulp')
const babel = require('gulp-babel')
const plumber = require('gulp-plumber')
const sourcemaps = require('gulp-sourcemaps')
const ts = require('gulp-typescript')
const merge = require('merge2')

const outDir = 'dist'
const paths = ['src/**/*.ts', 'typings/**/*.d.ts']

gulp.task('ts', () => {
  const tsStream = gulp.src(paths)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(ts(ts.createProject('tsconfig.json', {
      typescript: require('typescript'),
    })))

  const merged = merge([
    tsStream.js.pipe(babel())
      .pipe(sourcemaps.write('.')),
    tsStream.dts,
  ])
    .pipe(gulp.dest(outDir))

  return merged
})

gulp.task('default', ['ts'])
gulp.task('watch', ['default'], () => {
  gulp.watch(paths, ['ts'])
})
