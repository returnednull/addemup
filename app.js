const { program } = require('commander')
const fs = require('fs')
program
  .name('Add \'Em Up')
  .description('Add \'Em Up solution. See README.md for more details.')
  .option('--in <file>', 'Input file', 'in.txt')
  .option('--out <file>', 'Output file', 'out.txt')
  .option('--verbose', 'Verbosity', false)

program.parse()
const options = program.opts()
const { verbose } = options

// A = Aces, J = Jacks, Q = Queens, K = Kings
const faceValues = {
  A: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13
}

// S = Spades, H = Hearts, D = Diamonds and C = Clubs
const suitValues = {
  C: 1,
  D: 2,
  H: 3,
  S: 4
}

const parseFile = (file) => {
  try {
    const data = fs.readFileSync(file, 'utf8')
    const pipeline = data
      .split('\r\n') // split into lines
      .reduce((acc, line) => { // organize array elements
        const player = line.split(':')[0] // split string from ':' and get first element as player name
        const cards = line.split(':')[1] // split string from ':' and get last element as comma seperated cards list
          .split(',') // split cards list into array
          .map((card) => { // organize array elements
            const suit = card.slice(-1) // slice card string from last character to get suit
            const face = card.slice(0, -1) // slice card string from first to last character to get face
            return { suit, face } // return organized card object instead of comma seperated string
          })
        return { ...acc, [player]: { cards } } // return object of Player objects which has player name as key because of ease of use. e.g: players['Matt'].cards, otherwise: players.find(player => player.name === 'Matt').cards
      }, [])
    return pipeline
  } catch (err) {
    throw new Error('Error reading or parsing file: ', err)
  }
}

const calculateFaceScore = (cards) => {
  const score = cards.reduce((prev, curr) => {
    return prev + faceValues[curr.face]
  }, 0)
  return score
}

const calculateSuitScore = (cards) => {
  const score = cards.reduce((prev, curr) => {
    return prev + suitValues[curr.suit]
  }, 0)
  return score
}

const getWinnerFaceScore = (players) => {
  const maxScore = Math.max(...Object.values(players).map(player => player.faceScore))
  return maxScore
}

const getWinnerSuitScore = (players) => {
  const maxScore = Math.max(...Object.values(players).map(player => player.suitScore))
  return maxScore
}

const getWinnersByFaceScore = (players, maxScore) => {
  const winners = Object.entries(players).filter(playerkv => players[playerkv[0]].faceScore === maxScore)
  return Object.fromEntries(winners)
}

const getWinnersBySuitScore = (players, maxScore) => {
  const winners = Object.entries(players).filter(playerkv => players[playerkv[0]].suitScore === maxScore)
  return Object.fromEntries(winners)
}

const exit = (output) => {
  try {
    fs.writeFileSync(options.out, output)
    if (verbose) {
      console.log(`Output writed: ${output}`)
    }
  } catch (err) {
    throw new Error('Error writing to output file: ', err)
  } finally {
    process.exit(0)
  }
}

function main () {
  let output = 'ERROR' // Output text to write
  try {
    const players = parseFile(options.in) // parse file get players object
    Object.keys(players).forEach((player) => { // loop through players object
      players[player].faceScore = calculateFaceScore(players[player].cards) // extends player object with scores
      players[player].suitScore = calculateSuitScore(players[player].cards)
      if (verbose) {
        console.log(`${player} - faceScore: ${players[player].faceScore} - suitScore: ${players[player].suitScore}`)
      }
    })
    const winnerFaceScore = getWinnerFaceScore(players) // calculate max face score
    if (verbose) {
      console.log(`winnerFaceScore: ${winnerFaceScore}`)
    }
    const winnersByFaceScore = getWinnersByFaceScore(players, winnerFaceScore) // get players that has max face score
    if (verbose) {
      console.log(`winnersByFaceScore: ${winnersByFaceScore}`)
    }
    if (Object.keys(winnersByFaceScore).length === 1) { // if there is only one winner
      output = `${Object.keys(winnersByFaceScore)[0]}:${winnerFaceScore}`
      exit(output)
    } else {
      const winnerSuitScore = getWinnerSuitScore(winnersByFaceScore) // calculate max suit score
      if (verbose) {
        console.log(`winnerSuitScore: ${winnerSuitScore}`)
      }
      const winnersBySuitScore = getWinnersBySuitScore(winnersByFaceScore, winnerSuitScore) // get tied players that has max suit score
      if (verbose) {
        console.log(`winners: ${Object.keys(winnersBySuitScore)}`)
      }
      if (Object.keys(winnersBySuitScore).length === 1) { // if there is only one winner
        output = `${Object.keys(winnersBySuitScore)[0]}:${winnerSuitScore}`
        exit(output)
      } else {
        output = `${Object.keys(winnersBySuitScore).join(',')}:${winnerSuitScore}`
        exit(output)
      }
      output = `${Object.keys(winnersBySuitScore).join(',')}:${winnerSuitScore}`
      exit(output)
    }
  } catch (error) {
    console.error(error)
    exit(output)
  }
}

main()
