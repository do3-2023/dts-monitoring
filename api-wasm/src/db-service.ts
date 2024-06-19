import { Pg } from "@fermyon/spin-sdk"
import { CreatePersonDto } from "./dtos/create-person.dto"
import { Person } from "./interfaces/person"

export const createPerson = (dbUrl: string, personDto: CreatePersonDto) => {
    try {
        Pg.execute(dbUrl, "insert into person (last_name, phone_number) values ($1, $2)", [personDto.last_name, personDto.phone_number])
    }
    catch {
        throw new Error("Error connecting to the database")
    }
}

export const getPeople = (dbUrl: string): Person[] => {
    try {
        let people = Pg.query(dbUrl, "select * from person", [])
        return people.rows.map((p) => {
            let person = p.toString().split(",")
            return {
                id: person[0],
                last_name: person[1],
                phone_number: person[2]
            } as Person
        })
    }
    catch  {
        throw new Error("Error connecting to the database")
    }
}