import path from 'path'
const staticFolder  = path.join("C:","Server","Backend","public")
const assets        = path.join(staticFolder, "assets")
const html          = path.join(staticFolder, "index.html")
const privateAssets = path.join(staticFolder, "privateAssets")
export const settings = {
  cookie: {
    name: 'dkgas',
    /**@description 30 days in seconds */
    duration: 24*30*3600*1000
  },
  jwt_key: 'EWklfdhkla@#124msdf@DS',
  appPath: { staticFolder, assets, html, privateAssets }
}