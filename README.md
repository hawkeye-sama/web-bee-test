# Appointment Service

The project structure is similiar to the initial code test [link](https://github.com/hawkeye-sama/node_test_new) (just copied that project over).

## Note

If you run across any issues, please reach out to me.

## Get started

Follow these steps to set up the project:

1. Run `npm i` to install all dependencies.
2. Run `npm run migrate` to create the necessary database tables.
3. Run `npm run seed` to seed the required data into the database. See `/src/database/seeder` for more information.
4. Run `npm run test` to execute the test cases. Six tests were created accordingly. See `/src/bookings/bookings.e2e.spec.ts` for more information.

## Endpoints

### GET

- `/bookings/service`: Gets all the available time slots for a service.

### POST

- `/bookings/service/appointment/:serviceId`: Adds a new appointment.

Example request body:

```json
{
  "startTime": "2023-04-22T09:00:00.000Z",
  "endTime": "2023-04-22T09:10:00.000Z",
  "clients": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    }
  ]
}

## Environment
`NodeJS: v18.15.0`
