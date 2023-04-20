import { MigrationInterface, QueryRunner } from 'typeorm';

export class MenHaircut1661860035294 implements MigrationInterface {
  name = 'MenHaircut1661860035294';

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // create service of men haircut
      await queryRunner.query(
        `INSERT INTO \`services\` (\`id\`, \`name\`) VALUES (1, 'Men Haircut')`,
      );

      // add breaks timing
      await queryRunner.query(`INSERT INTO breaks (\`startTime\`, \`endTime\`, \`serviceId\` , \`name\`) VALUES
        ('${new Date('2023-04-20T12:00:00')}', '${new Date(
        '2023-04-20T13:00:00',
      )}', 1, 'lunch break'),
        ('${new Date('2023-04-20T15:00:00')}', '${new Date(
        '2023-04-20T16:00:00',
      )}', 1, 'clean break')
      `);

      const today = new Date();

      // Set the third day from now as a public holiday
      const publicHoliday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 3,
      );

      await queryRunner.query(`
        INSERT INTO \`planned_off_dates\` (\`startDate\`, \`endDate\`, \`serviceId\`) VALUES
        ('${publicHoliday}', '${publicHoliday}', 1)
      `);

      // maximum 3 clients and duration of 10 minutes
      await queryRunner.query(`
      INSERT INTO \`configurations\` (\`maxClients\`, \`serviceId\`, \`duration\`, \`isPrimary\`) VALUES
      ('3', '1', '10', true)
      `);

      // slots for the next 7 days, Sunday off, from 08:00-20:00 Monday to Friday. From 10:00-22:00 Saturday.

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

      const slots = [];
      const cleanupDuration = 5;

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + i,
        );
        const currentDayOfWeek = currentDate.getDay();

        const timeRange = timeRanges.find((range) =>
          range.days.includes(currentDayOfWeek),
        );

        if (timeRange) {
          const [startHour, startMinute] = timeRange.start
            .split(':')
            .map(Number);
          const [endHour, endMinute] = timeRange.end.split(':').map(Number);

          const startTime = new Date(currentDate);
          startTime.setHours(startHour, startMinute, 0, 0);

          const endTime = new Date(currentDate);
          endTime.setHours(endHour, endMinute, 0, 0);

          while (startTime < endTime) {
            const slotStart = new Date(startTime);
            startTime.setMinutes(startTime.getMinutes() + 10);

            slots.push({
              start: slotStart,
              end: new Date(startTime),
              slotType: 'service',
            });

            const cleanUpTimeStart = new Date(startTime);
            startTime.setMinutes(startTime.getMinutes() + 5);

            slots.push({
              start: cleanUpTimeStart,
              end: new Date(startTime),
              slotType: 'cleanup',
            });
          }
        }
      }

      for (const slot of slots) {
        // 10-minute slot for the service
        await queryRunner.query(`
          INSERT INTO \`time_slots\` (\`startTime\`, \`endTime\`, \`serviceId\`, \`slotType\`) VALUES
          ('${slot.start}', '${slot.end}', 1, '${slot.slotType}')
        `);
      }
    } catch (err) {
      throw err;
    }
  }

  public async down(): Promise<void> {
    //empty
  }
}
