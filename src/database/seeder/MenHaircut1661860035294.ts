import { MigrationInterface, QueryRunner } from 'typeorm';

export class MenHaircut1661860035294 implements MigrationInterface {
  name = 'MenHaircut1661860035294';

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // create service of men haircut
      await queryRunner.query(
        `INSERT INTO \`service\` (\`id\`, \`name\`, \`duration\`, \`cleanupDuration\`) VALUES (1, 'Men Haircut', 10, 5)`,
      );

      // add breaks timing
      await queryRunner.query(`INSERT INTO \`break\` (\`startTime\`, \`endTime\`, \`serviceId\` , \`name\`) VALUES
        ('${new Date('2023-04-20T12:00:00')}', '${new Date(
        '2023-04-20T13:00:00',
      )}', 1, 'lunch break'),
        ('${new Date('2023-04-20T15:00:00')}', '${new Date(
        '2023-04-20T16:00:00',
      )}', 1, 'clean break')
      `);

      const today = new Date();

      // Set the third day from now as a public holiday
      const publicHolidayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 3,
      );

      const publicHolidayEnd = new Date(
        publicHolidayStart.getFullYear(),
        publicHolidayStart.getMonth(),
        publicHolidayStart.getDate() + 1,
      );

      await queryRunner.query(`
        INSERT INTO \`planned_off_date\` (\`startTime\`, \`endTime\`, \`serviceId\`) VALUES
        ('${publicHolidayStart}', '${publicHolidayEnd}', 1)
      `);

      // maximum 3 clients and duration of 10 minutes
      await queryRunner.query(`
      INSERT INTO \`configuration\` (\`maxClients\`, \`serviceId\`, \`maxDaysInFuture\`) VALUES
      ('3', '1', '7')
      `);

      // Weekly Schedule for Monday to Friday (08:00-20:00) and Saturday (10:00-22:00)

      const dayOfWeek = {
        SUNDAY: 0,
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6,
      };

      const timeRanges = [
        {
          start: '08:00',
          end: '20:00',
          days: [
            dayOfWeek.MONDAY,
            dayOfWeek.TUESDAY,
            dayOfWeek.WEDNESDAY,
            dayOfWeek.THURSDAY,
            dayOfWeek.FRIDAY,
          ],
        },
        { start: '10:00', end: '22:00', days: [dayOfWeek.SATURDAY] },
      ];

      const currentDate = new Date();

      for (const timeRange of timeRanges) {
        const [startHour, startMinute] = timeRange.start.split(':').map(Number);
        const [endHour, endMinute] = timeRange.end.split(':').map(Number);

        const startTime = new Date(currentDate);
        startTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date(currentDate);
        endTime.setHours(endHour, endMinute, 0, 0);

        for (const day of timeRange.days) {
          await queryRunner.query(`
            INSERT INTO \`weekly_schedule\` (\`startTime\`, \`endTime\`, \`serviceId\`, \`dayOfTheWeek\`) VALUES
            ('${startTime}', '${endTime}', 1, '${day}')
          `);
        }
      }
    } catch (err) {
      throw err;
    }
  }

  public async down(): Promise<void> {
    //empty
  }
}
