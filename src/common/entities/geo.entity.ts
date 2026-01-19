import { Column } from 'typeorm';

export abstract class GeoEntity {
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}
