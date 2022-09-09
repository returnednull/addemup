# Add \'Em Up Javascript Solution
I came across with this interview question on social media:

## Question
<details>
  <summary>Add 'Em Up Interview Question</summary>
  We've created a simple multiplayer card game called "Add 'Em Up" where 5 players are dealt 5 cards
  from a standard 52 card pack, and the winner is the one with the highest  score. The score for each
  player is calculated by adding up the card values for each player, where the  number cards have their
  face value, J = 11, Q = 12, K = 13 and A = 1 (not 11). In the event of a tie,   the scores are
  recalculated for only the tied players by calculating a "suit score" for each   player to see if the tie can
  be broken (it may not). Each card is given a score based on its suit, with  spades = 4, hearts = 3,
  diamonds = 2 and clubs = 1, and the player's score is the sum of the 5 values.
  You are required to write a production ready command line application using   C#, Java or JavaScript
  (Node application) that needs to do the following:
  • Run on Windows.
  • Be invoked with the name of the input and output text files.
  • Read the data from the input file, find the winner(s) and write them to the   output file.
  • Handle any problems with the input.
  Command Parameters
  The command parameters can be in any order and are relative to the current  folder, or absolute.
  --in abc.txt --out xyz.txt
  Input File Structure
  The input file will contain 5 rows, one for each player's hand of 5 cards.  Each row will contain the
  player's name separated by a colon then a comma separated list of the 5   cards. Each card will be 2
  characters, the face value followed by the suit
  
  ```
  S = Spades, 
  H = Hearts, 
  D = Diamonds,
  C = Clubs,
  ```

  e.g.

  ```
  Name1:AH,3C,8C,2S,JD
  Name2:KD,QH,10C,4C,AC
  Name3:6S,8D,3D,JH,2D
  Name4:5H,3S,KH,AS,9D
  Name5:JS,3H,2H,2C,4D
  ```


  Output File Structure
  The output file should contain a single line, with one of the following 3   possibilities:

  1. The name of the winner and their score (colon separated).
  
  2. A comma separated list of winners in the case of a tie and the score (colon   separated).

  3. "ERROR", if the input file had any issue.

  E.g.
  NameX:40

  // or

  NameX,NameY:35

  // or

  ERROR

  Application Execution
  Your application will be tested using an automated test runner, so your   application must run to
  completion without any user input.
</details>

## Solution Logic
1. Parse command line arguments

      I used [Commander](https://www.npmjs.com/package/commander) for this
      ```js
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
      ```

2. Declare symbol to numeric matches

      ```js
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
      ```

3. Read and parse input file

      ```js
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
      ```

4. Calculate face and suit scores by cards of player

      ```js
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
      ```

5. Calculate face and suit scores by cards of player

      ```js
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
      ```

6. Get maximum face and suit scores of players for finding winner(s)

      ```js
      const getWinnerFaceScore = (players) => {
        const maxScore = Math.max(...Object.values(players).map(player => player.faceScore))
        return maxScore
      }

      const getWinnerSuitScore = (players) => {
        const maxScore = Math.max(...Object.values(players).map(player => player.suitScore))
        return maxScore
      }
      ```

7. Get maximum face and suit scored players

      ```js
      const getWinnersByFaceScore = (players, maxScore) => {
        const winners = Object.entries(players).filter(playerkv => players[playerkv[0]].faceScore === maxScore)
        return Object.fromEntries(winners)
      }

      const getWinnersBySuitScore = (players, maxScore) => {
        const winners = Object.entries(players).filter(playerkv => players[playerkv[0]].suitScore === maxScore)
        return Object.fromEntries(winners)
      }
      ```

8. Put those things together

      ```js
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
            const winnersBySuitScore = getWinnersBySuitScore(winnersByFaceScore, winnerSuitScore) // get tied players that      has max suit score
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
      ```

      <details>
      <summary>Final Code</summary>

      ```js
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
              return { ...acc, [player]: { cards } } // return object of Player objects which has player name as key      because of ease of use. e.g: players['Matt'].cards, otherwise: players.find(player => player.name ===     'Matt').cards
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
            const winnersBySuitScore = getWinnersBySuitScore(winnersByFaceScore, winnerSuitScore) // get tied players that      has max suit score
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

      ```

      </details>

## Installation
```
git clone https://github.com/returnednull/addemup
npm install
```
Running app:
```
node app --in in.txt --out out.txt
```
Enable verbosity:
```
node app --in in.txt --out out.txt --verbose
```
Help:
```
node app --help
```