# Delivery Load Optimization

## Getting Started

### Dependencies

NOTE: System dependency versions are defined explicitly as the project was built/tested with, but may still work with older/newer verions.

- Node.js v21.6.2 (if you use NVM, it should handle this for you)
- Yarn v1.22.21 (optional, but recommended)

### Setup

For convenience, the bundled package has been included in the repository, so the following command (run from the project root) should be sufficient to run the provided test suite:

```
yarn test
```

If that fails in any way, then do the following (from the project root directory):

1. Install dependencies with `yarn install` (`npm install` should also work, but may result in dependency versioning issues).
2. Build the project with `yarn build` (or `npm run build`).
3. Run the test suite with `yarn test` (or `npm test`).

## Solution

### Language & Tooling Selection

I decided on TypeScript because that is the language that I felt most confident in quickly setting up a well organized project.

The tooling setup is fairly minimul, but provides basic build tooling, linting, and formatting that is extensible in a way that could support further development of the project.

If execution time were a higher priorety, then I may have chosen a lower level language like C++ or Rust, but I did not evaluate this as a constraint worthy of concern.

### Thought Process

I decided to take a simple/intuitive approach at first, and it worked out to be fairly optimal with a mean cost of 47963.81 (execution time of 100ms on my machine):

- Sort deliveries `d1` by distance to pickup location
- For each delivery, create a list of other deliveries `d2` sorted by distance between `d1.dropoff` and `d2.pickup`
- Starting from the main list of deliveries, recursively traverse followup deliveries to create routes

I played around with how recursion entry points impacted the cost, and found that simply starting from the clossest routes worked out best.

I did briefly consider a k-means clustering approach to grouping the data, but felt that this would be challenging to tune.
