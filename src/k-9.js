"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const discord_js_1 = require("discord.js");
const config_json_1 = require("./config.json");
const fs_1 = __importDefault(require("fs"));
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const commands = [];
exports.client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.Intents.FLAGS.DIRECT_MESSAGES
    ],
    partials: [
        'CHANNEL'
    ]
});
function deployCommands() {
    return __awaiter(this, void 0, void 0, function* () {
        const commandFiles = fs_1.default.readdirSync(__dirname + '/commands').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(__dirname + `/commands/${file}`);
            commands.push(command.data.toJSON());
        }
        const rest = new rest_1.REST({ version: '9' }).setToken(config_json_1.token);
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield rest.put(v9_1.Routes.applicationGuildCommands(config_json_1.clientId, config_json_1.galifreyGuildID), { body: commands });
            }
            catch (error) {
                console.error(error);
            }
        }))();
    });
}
exports.client.login(config_json_1.token);
exports.client.once('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    yield deployCommands();
}));
exports.client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isCommand())
        return;
    const command = commands.find(x => x.name === interaction.commandName);
    if (!command)
        return;
    else {
        const commandSuccess = yield command.execute(interaction);
    }
}));
