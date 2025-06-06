const Discord = require('discord.js')

let { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js")

const Color = `#ffcc00`

let number = require("../../function/numbers")
let emo = require("../../emojis")
const eco = require('../../schemas/economy');
let inventory = require('../../schemas/inv')
let shopList = require('../../economy/shop')

module.exports = {
  name: 'fish',
  category: "economy",
  description: 'Go fish sum fish',
  usage: '?fish',
  aliases: ['fishing'],
  timeout: 45,
  boostersOnly: false,
  // cooldownMsg: {title: "Slow Down!", description: "> You can use this command every **${timecommand}**!\n> Try again in: **${timeleft}**", color: "RED"},
  run: async (client, message, args) => {

    let inv = await inventory.findOne({
      User: message.author.id
    })

    if (!inv || !inv.Inventory.fishingrod) return message.channel.send(`You need a fishing rod to go fishing!`)

    let chances = Math.floor(Math.random() * 3)

    let locations = [" in an EXOTIC PLACE", ' at the beach', ' near your home', ' ', ' at the beach', ' near your home', ' ', ' at the beach', ' near your home', ' ']
    let location = locations[Math.floor(Math.random() * locations.length)]

    let desc;

    let exotic;
    if (location == ' in an EXOTIC PLACE') exotic = 1

    let common = Math.floor(Math.random() * 2)
    let commonn = Math.floor(Math.random() * 2)

    let rare = Math.floor(Math.random() * 12)

    let items = {}

    if (exotic && exotic == 1) {
      let chancesToGetAmount = Math.floor(Math.random() * 10)
      let amount;
      if (chancesToGetAmount == 1) {
        amount = Math.floor(Math.random() * (1 + 5 - 2) + 2)
      } else {
        amount = Math.floor(Math.random() * (1 + 2 - 1) + 1)
      }
      items['exoticfish'] = amount
    }
    if (rare == 1) {
      let chancesToGetAmount = Math.floor(Math.random() * 7)
      let amount;
      if (chancesToGetAmount == 1) { amount = Math.floor(Math.random() * (1 + 5 - 2) + 2) } else {
        amount = Math.floor(Math.random() * (1 + 3 - 1) + 1)
      }
      items['rarefish'] = amount
    }
    if (common == 1 || commonn == 1) {
      let chancesToGetAmount = Math.floor(Math.random() * 3)
      let amount;
      if (chancesToGetAmount == 1) { amount = Math.floor(Math.random() * (1 + 5 - 2) + 2) } else {
        amount = Math.floor(Math.random() * (1 + 3 - 1) + 1)
      }
      items['commonfish'] = amount
    }

    if (!Object.keys(items).length) {
      let amount = Math.floor(Math.random() * (1 + 3000 - 1000) + 1000)
      let banknoteRates = Math.floor(Math.random() * 10)
      message.reply(`You found nothing but got **⏣${number(amount)}** ${banknoteRates == 1 ? 'and a blob <a:blob:911539339232686081>' : ''}`)
      if (banknoteRates == 1) {
        const params = {
          User: message.author.id
        }

        function isEmpty(obj) {
          for (var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
              return false;
            }
          }

          return JSON.stringify(obj) === JSON.stringify({});
        }
        if (inv && !isEmpty(inv.Inventory)) {
          const hasItem = Object.keys(inv.Inventory).includes('blob')
          if (!hasItem) {
            inv.Inventory['blob'] = 1;
          } else {
            inv.Inventory['blob'] = inv.Inventory['blob'] + 1;
          }
          await inventory.findOneAndUpdate(params, inv)
        } else {
          new inventory({
            User: message.author.id,
            Inventory: { [itemToBuy]: amountToBuy }
          }).save()
        }
      }
      await eco.findOneAndUpdate({
        userID: message.author.id
      }, {
        $inc: {
          coins: amount
        }
      })
    } else {
      const findShopItem = (search) => shopList.find(({ items }) => items.toLowerCase() === search);
      let mapped = Object.keys(items).map((value) => {
        let fishes = findShopItem(value)

        return `${fishes.emoji} | ${value.replace('fish', ' fish')} — (x${items[value]})`
      })
      if (chances == 0) {
        message.reply("You went fishing and got NOTHING!")
      } else {
        let amountt = Math.floor(Math.random() * (1 + 900 - 450) + 350)
        if (Math.floor(Math.random() * 3) !== 1) amountt = 0
        let worth = Object.keys(items).reduce((currentWorth, item) => {
          return findShopItem(item).price.sell * items[item] + currentWorth
        }, 0)
        let embed = new MessageEmbed()
          .setTitle(`${message.author.username} Fishing`)
          .setDescription(`You went fishing${location} and found:\n${mapped.join('\n')}\n${amountt !== 0 ? `You also found **⏣${amountt}**` : ''}`)
          .setFooter(`Sell: ⏣${number(worth + amountt)}`)
        message.channel.send({ embeds: [embed] })
        function isEmpty(obj) {
          for (var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
              return false;
            }
          }

          return JSON.stringify(obj) === JSON.stringify({});
        }
        let params = {
          User: message.author.id
        }
        let data = {};
        Object.keys(items).forEach(async (fish) => {
          if (inv && !isEmpty(inv.Inventory)) {
            const hasItem = Object.keys(inv.Inventory).includes(fish)
            if (!hasItem) {
              inv.Inventory[fish] = items[fish];
            } else {
              inv.Inventory[fish] = inv.Inventory[fish] + items[fish];
            }
          }
        })
        await inventory.findOneAndUpdate(params, inv)
        if (amountt !== 0) {
          await eco.findOneAndUpdate({
            userID: message.author.id
          }, {
            $inc: {
              coins: amountt
            }
          })
        }
      }
    }

  }
}