const jwt=require('jsonwebtoken');
const {persistentDatabaseAvailable}=require('../db');
const isProduction=process.env.NODE_ENV==='production'||Boolean(process.env.VERCEL);
const JWT_SECRET=process.env.JWT_SECRET||(isProduction?null:'nexora_local_development_only_change_me');
const isJwtSecretConfigured=typeof JWT_SECRET==='string'&&Buffer.byteLength(JWT_SECRET,'utf8')>=32;
const isAccountsReady=persistentDatabaseAvailable()&&isJwtSecretConfigured;
function catalogueIsLiveFor(env=process.env){return String(env.CATALOGUE_LIVE||'').trim().toLowerCase()==='true';}
const isCatalogueLive=catalogueIsLiveFor();
const isCommerceReady=isAccountsReady&&isCatalogueLive;
function unavailable(res){return res.status(503).json({error:'Accounts and ordering are temporarily unavailable until a persistent database and JWT_SECRET are configured.'});}
function requireJwtSecret(req,res,next){if(!persistentDatabaseAvailable())return unavailable(res);if(!isJwtSecretConfigured)return res.status(503).json({error:'Set a private JWT_SECRET of at least 32 bytes.'});next();}
function requireLiveCatalogue(req,res,next){
  if(!isAccountsReady)return unavailable(res);
  if(!isCatalogueLive)return res.status(503).json({error:'Order placement is paused until the store owner verifies the real product catalogue, prices, images, inventory, promotions, and fulfilment.',code:'CATALOGUE_NOT_LIVE'});
  next();
}
function authMiddleware(req,res,next){const header=req.headers.authorization;if(!header){req.user=null;return next();}if(!header.startsWith('Bearer '))return res.status(401).json({error:'Invalid authorization header.'});if(!persistentDatabaseAvailable()||!isJwtSecretConfigured)return unavailable(res);const token=header.slice(7).trim();if(!token)return res.status(401).json({error:'Authentication token is missing.'});try{req.user=jwt.verify(token,JWT_SECRET,{algorithms:['HS256']});next();}catch(_){req.user=null;return res.status(401).json({error:'Session expired or invalid. Please sign in again.');}}
function requireAuth(req,res,next){if(!persistentDatabaseAvailable()||!isJwtSecretConfigured)return unavailable(res);if(!req.user||!req.user.id||!req.user.email)return res.status(401).json({error:'Please sign in to continue.'});next();}
function requireAdmin(req,res,next){if(!persistentDatabaseAvailable()||!isJwtSecretConfigured)return unavailable(res);if(!req.user||!req.user.id||!req.user.email)return res.status(401).json({error:'Please sign in to continue.'});if(req.user.role!=='admin')return res.status(403).json({error:'Administrator access is required.'});next();}
module.exports={JWT_SECRET,isJwtSecretConfigured,isAccountsReady,isCatalogueLive,isCommerceReady,catalogueIsLiveFor,authMiddleware,requireAuth,requireAdmin,requireJwtSecret,requireLiveCatalogue,requirePersistentDatabase:(req,res,next)=>persistentDatabaseAvailable()?next():unavailable(res),persistentDatabaseAvailable};
