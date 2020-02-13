import * as functions from 'firebase-functions'
import request from 'request'
import moment from 'moment-timezone'

const sendSlack = (message: string) => {
  const option = {
    url: 'https://hooks.slack.com/services/xxx',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    json: { text: message },
  }
  request(option)
}

const executeLogic = async (): Promise<string> => {
  const friendsData = await executeRequest('https://api.doorkeeper.jp/groups/uipath-friends')
  const womenData = await executeRequest('https://api.doorkeeper.jp/groups/uipath-friends-women')

  const now = moment()
  let message: string = ''

  message += `${friendsData.group.name} のメンバ数: ${friendsData.group.members_count}\n`
  message += `${womenData.group.name} のメンバ数: ${womenData.group.members_count}\n`
  message += `${friendsData.group.public_url}\n`
  message += `${womenData.group.public_url}\n`
  message += `(${now.tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm')} 時点)`
  console.log(message)
  sendSlack(message)
  return message
}

// export const checkDoorkeeper = functions.https.onRequest(async (req, response) => {
//   const message = await executeLogic()
//   response.end(message)
// })

export const checkDoorkeeperPubSub = functions.pubsub
  .schedule('0 18 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async context => {
    await executeLogic()
  })

function executeRequest(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    request(url, (err, response, body) => {
      if (err) {
        reject(err)
        return
      }
      const obj = JSON.parse(body)
      resolve(obj)
      return
    })
  })
}
