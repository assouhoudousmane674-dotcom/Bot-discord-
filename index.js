const { Client, GatewayIntentBits, Collection, ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder } = require("discord.js");
const { token } = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
client.commands = new Collection();

// ------------------- Commandes centralisées -------------------
const commands = {};

// Ping
commands.ping = {
  name: "ping",
  description: "Vérifie la latence du bot",
  run: async(interaction) => {
    await interaction.reply(`🏓 Pong ! Latence : ${client.ws.ping}ms`);
  }
};

// Userinfo
commands.userinfo = {
  name: "userinfo",
  description: "Affiche les infos d'un membre",
  options: [{ name:"membre", description:"Le membre", type:6, required:false }],
  run: async(interaction) => {
    const user = interaction.options.getUser("membre") || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    await interaction.reply(`Pseudo: ${user.tag}\nID: ${user.id}\nRôles: ${member.roles.cache.map(r=>r.name).join(", ")}`);
  }
};

// Serverinfo
commands.serverinfo = {
  name: "serverinfo",
  description: "Info serveur",
  run: async(interaction)=>{
    const guild = interaction.guild;
    await interaction.reply(`Nom: ${guild.name}\nMembres: ${guild.memberCount}\nCréé le: ${guild.createdAt.toDateString()}`);
  }
};

// RPS
commands.rps = {
  name: "rps",
  description: "Pierre-Feuille-Ciseaux",
  options:[{name:"choix",description:"Pierre/Feuille/Ciseaux",type:3,required:true}],
  run: async(interaction)=>{
    const choix = interaction.options.getString("choix").toLowerCase();
    const options = ["pierre","feuille","ciseaux"];
    const botChoice = options[Math.floor(Math.random()*3)];
    let result = "Égalité !";
    if((choix==="pierre" && botChoice==="ciseaux") || (choix==="ciseaux" && botChoice==="feuille") || (choix==="feuille" && botChoice==="pierre")) result="Tu gagnes !";
    else if(choix!==botChoice) result="Tu perds !";
    await interaction.reply(`Tu as choisi: ${choix}\nBot: ${botChoice}\nRésultat: ${result}`);
  }
};

// Coinflip
commands.coinflip = {
  name: "coinflip",
  description: "Lance une pièce",
  options:[{name:"pileface",description:"Pile ou Face",type:3,required:true}],
  run: async(interaction)=>{
    const choix = interaction.options.getString("pileface").toLowerCase();
    const botChoice = Math.random()<0.5?"pile":"face";
    const result = (choix===botChoice)?"Tu gagnes !":"Tu perds !";
    await interaction.reply(`Tu as choisi: ${choix}\nRésultat: ${botChoice}\n${result}`);
  }
};

// Meme
commands.meme = {
  name:"meme",
  description:"Envoie un meme aléatoire",
  run: async(interaction)=>{
    const memes = ["https://i.imgur.com/1.jpg","https://i.imgur.com/2.jpg","https://i.imgur.com/3.jpg"];
    const meme = memes[Math.floor(Math.random()*memes.length)];
    await interaction.reply({content:meme});
  }
};

// Quote
commands.quote = {
  name:"quote",
  description:"Citation aléatoire",
  run: async(interaction)=>{
    const quotes = ["Ne jamais abandonner.","Le fun avant tout!","Rire c'est la vie."];
    const q = quotes[Math.floor(Math.random()*quotes.length)];
    await interaction.reply(q);
  }
};

// Modération
commands.mute = {
  name:"mute",
  description:"Mute un membre",
  options:[{name:"membre",type:6,description:"Membre à mute",required:true}],
  run: async(interaction)=>{
    if(!interaction.member.permissions.has("Administrator")) return interaction.reply("❌ Pas autorisé.");
    const member = interaction.options.getMember("membre");
    const role = interaction.guild.roles.cache.find(r=>r.name.toLowerCase()==="mute");
    if(!role) return interaction.reply("Rôle mute non trouvé");
    await member.roles.add(role);
    interaction.reply(`${member.user.tag} a été mute.`);
  }
};

commands.unmute = {
  name:"unmute",
  description:"Unmute un membre",
  options:[{name:"membre",type:6,description:"Membre à unmute",required:true}],
  run: async(interaction)=>{
    if(!interaction.member.permissions.has("Administrator")) return interaction.reply("❌ Pas autorisé.");
    const member = interaction.options.getMember("membre");
    const role = interaction.guild.roles.cache.find(r=>r.name.toLowerCase()==="mute");
    if(!role) return interaction.reply("Rôle mute non trouvé");
    await member.roles.remove(role);
    interaction.reply(`${member.user.tag} a été unmute.`);
  }
};

commands.clear = {
  name:"clear",
  description:"Supprime des messages",
  options:[{name:"nombre",type:4,description:"Nombre de messages à supprimer",required:true}],
  run: async(interaction)=>{
    if(!interaction.member.permissions.has("Administrator")) return interaction.reply("❌ Pas autorisé.");
    const count = interaction.options.getInteger("nombre");
    const deleted = await interaction.channel.bulkDelete(count,true);
    interaction.reply(`✅ ${deleted.size} messages supprimés.`);
  }
};

// Menu central /config
commands.config = {
  name:"config",
  description:"Menu central du bot",
  run: async(interaction)=>{
    const isAdmin = interaction.member.permissions.has("Administrator");
    const embed = {
      title:"Empire Gestion – Menu central",
      color:0x00ffcc,
      description:"Choisis une catégorie",
      fields:[
        {name:"🎮 Jeux", value:"RPS, Coinflip...", inline:true},
        {name:"😂 Fun", value:"Meme, Quote...", inline:true},
        {name:"⚙️ Utilitaires", value:"userinfo, serverinfo, ping...", inline:true},
        {name:"🛡️ Modération", value:isAdmin?"Mute, Unmute, Clear...":"Seulement pour les admins", inline:true}
      ]
    };
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
      .setCustomId("menuSelect")
      .setPlaceholder("Choisis une action...")
      .addOptions([
        {label:"Jeux", description:"Accéder aux jeux", value:"games"},
        {label:"Fun", description:"Commandes fun", value:"fun"},
        {label:"Utilitaires", description:"Commandes utiles", value:"utils"},
        {label:"Modération", description:"Commandes modération", value:"mod"}
      ])
    );
    await interaction.reply({ embeds:[embed], components:[row] });
  }
};

// ------------------- Événements -------------------
client.on("ready", ()=>console.log(`Bot connecté : ${client.user.tag}`));

client.on("interactionCreate", async(interaction)=>{
  // Menu select
  if(interaction.isStringSelectMenu() && interaction.customId==="menuSelect"){
    const value = interaction.values[0];
    const isAdmin = interaction.member.permissions.has("Administrator");
    if(value==="games") interaction.update({content:"🎮 Jeux disponibles : /rps, /coinflip", components:[]});
    else if(value==="fun") interaction.update({content:"😂 Fun : /meme, /quote", components:[]});
    else if(value==="utils") interaction.update({content:"⚙️ Utilitaires : /userinfo, /serverinfo, /ping", components:[]});
    else if(value==="mod"){
      if(isAdmin) interaction.update({content:"🛡️ Modération : /mute, /unmute, /clear", components:[]});
      else interaction.update({content:"❌ Vous n'êtes pas admin.", components:[]});
    }
  }

  // Slash commands
  if(interaction.isChatInputCommand()){
    const command = commands[interaction.commandName];
    if(!command) return;
    try{ await command.run(interaction); }catch(err){ console.error(err); interaction.reply({content:"Erreur.",ephemeral:true}); }
  }
});

// ------------------- Login -------------------
client.login(token);
