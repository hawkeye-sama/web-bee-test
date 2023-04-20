import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class BookingDB1661860035294 implements MigrationInterface {
  name = 'BookingDB1661860035294';

  public async up(queryRunner: QueryRunner): Promise<void> {
    /** ---- TABLES ---- */

    // Create User table
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'firstName', type: 'varchar' },
          { name: 'lastName', type: 'varchar' },
          { name: 'email', type: 'varchar' },
        ],
      }),
    );

    // Create Service table
    await queryRunner.createTable(
      new Table({
        name: 'service',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar' },
          { name: 'duration', type: 'integer' },
          { name: 'cleanupDuration', type: 'integer' },
        ],
      }),
    );

    // Create Booking table
    await queryRunner.createTable(
      new Table({
        name: 'booking',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'userId', type: 'integer' },
          { name: 'serviceId', type: 'integer' },
          { name: 'bookingStartTime', type: 'datetime' },
          { name: 'bookingEndTime', type: 'datetime' },
        ],
      }),
    );

    // Create Break table
    await queryRunner.createTable(
      new Table({
        name: 'break',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar' },
          { name: 'startTime', type: 'datetime' },
          { name: 'endTime', type: 'datetime' },
          { name: 'serviceId', type: 'integer' },
        ],
      }),
    );

    // Create Configuration table
    await queryRunner.createTable(
      new Table({
        name: 'configuration',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'maxClients', type: 'integer' },
          { name: 'serviceId', type: 'integer' },
          { name: 'maxDaysInFuture', type: 'integer' },
        ],
      }),
    );

    // Create PlannedOffDate table
    await queryRunner.createTable(
      new Table({
        name: 'planned_off_date',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'startTime', type: 'datetime' },
          { name: 'endTime', type: 'datetime' },
          { name: 'serviceId', type: 'integer' },
        ],
      }),
    );

    // Create WeeklySchedule table
    await queryRunner.createTable(
      new Table({
        name: 'weekly_schedule',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'startTime', type: 'datetime' },
          { name: 'endTime', type: 'datetime' },
          { name: 'serviceId', type: 'integer' },
          { name: 'dayOfTheWeek', type: 'integer' },
        ],
      }),
    );

    /** ---- FOREIGN KEYS ---- */

    // WeeklySchedule table
    await queryRunner.createForeignKey(
      'weekly_schedule',
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'service',
        onDelete: 'CASCADE',
      }),
    );

    // PlannedOffDate table
    await queryRunner.createForeignKey(
      'planned_off_date',
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'service',
        onDelete: 'CASCADE',
      }),
    );

    // Configuration table
    await queryRunner.createForeignKey(
      'configuration',
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'service',
        onDelete: 'CASCADE',
      }),
    );

    // Break table
    await queryRunner.createForeignKey(
      'break',
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'service',
        onDelete: 'CASCADE',
      }),
    );

    // Bookings table
    await queryRunner.createForeignKey(
      'booking',
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'service',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'booking',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(): Promise<void> {
    //empty
  }
}
