export const production = process.env.NODE_ENV === 'production'
const prodEnv = (name: string) => {
  if (production && !process.env[name]) {
    throw Error(`Environment variable ${name} is not set`)
  }
  return process.env[name]
}

export const dataDir = production ? prodEnv('RAXA_DATA_DIR') : '.'
export const pluginDir = `${dataDir}/plugins`
