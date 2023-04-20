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
        name: 'users',
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
        name: 'services',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar' },
        ],
      }),
    );

    // Create TimeSlot table
    await queryRunner.createTable(
      new Table({
        name: 'time_slots',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'slotType', type: 'varchar' }, // can be either service or cleanup
          { name: 'startTime', type: 'datetime' },
          { name: 'endTime', type: 'datetime' },
          { name: 'serviceId', type: 'integer' },
        ],
      }),
    );

    // Create Booking table
    await queryRunner.createTable(
      new Table({
        name: 'bookings',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'userId', type: 'integer' },
          { name: 'timeSlotId', type: 'integer' },
          { name: 'bookingDate', type: 'datetime' },
        ],
      }),
    );

    // Create Break table
    await queryRunner.createTable(
      new Table({
        name: 'breaks',
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
        name: 'configurations',
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
          { name: 'duration', type: 'integer' },
          { name: 'isPrimary', type: 'boolean' },
        ],
      }),
    );

    // Create PlannedOffDate table
    await queryRunner.createTable(
      new Table({
        name: 'planned_off_dates',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'startDate', type: 'datetime' },
          { name: 'endDate', type: 'datetime' },
          { name: 'serviceId', type: 'integer' },
        ],
      }),
    );

    /** ---- FOREIGN KEYS ---- */

    // PlannedOffDate table
    await queryRunner.createForeignKey(
      'planned_off_dates',
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'services',
        onDelete: 'CASCADE',
      }),
    );

    // Configuration table
    await queryRunner.createForeignKey(
      'configurations',
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'services',
        onDelete: 'CASCADE',
      }),
    );

    // Break table
    await queryRunner.createForeignKey(
      'breaks',
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'services',
        onDelete: 'CASCADE',
      }),
    );

    // Bookings table
    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({
        columnNames: ['timeSlotId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'time_slots',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // TimeSlot table
    await queryRunner.createForeignKey(
      'time_slots',
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'services',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(): Promise<void> {
    //empty
  }
}
