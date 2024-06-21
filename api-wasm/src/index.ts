import { HandleRequest, HttpRequest, HttpResponse, Router, Config } from "@fermyon/spin-sdk"
import { CreatePersonDto } from "./dtos/create-person.dto"
import { createPerson, getPeople } from "./db-service"
import { Person } from "./interfaces/person"

let router = Router()

const decoder = new TextDecoder()
const encoder = new TextEncoder()

function handleGetRoute() {
  const dbUrl = Config.get("postgres_url")
  try {
    let people = getPeople(dbUrl)
    return {
      status: 200,
      headers: { "content-type": "application/json" },
      body: encoder.encode(JSON.stringify(people))
    }
  }
  catch {
    return {
      status: 500,
      headers: { "content-type": "text/plain" },
      body: encoder.encode("Error getting people from the database")
    }
  }

}

function handlePostRoute(body: ArrayBuffer) {
  const dbUrl = Config.get("postgres_url")
  try {
    const json: CreatePersonDto = JSON.parse(decoder.decode(body))
    createPerson(dbUrl, json)
    let newPerson: Person = {
      id: "-1",
      ...json
    }
    return {
      status: 201,
      headers: { "content-type": "application/json" },
      body: encoder.encode(JSON.stringify(newPerson))
    }
  }
  catch {
    return {
      status: 500,
      headers: { "content-type": "text/plain" },
      body: encoder.encode("Error creating a new person")
    }
  }

}

function handleHealthRoute() {
  const dbUrl = Config.get("postgres_url")
  try {
    getPeople(dbUrl)
    return {
      status: 200,
      headers: { "content-type": "text/plain" },
      body: encoder.encode("heath test passed")
    }
  }
  catch {
    return {
      status: 500,
      headers: { "content-type": "text/plain" },
      body: encoder.encode("Error connecting to the database")
    }
  }

}

router.get("/", handleGetRoute)
router.get("/healthz", handleHealthRoute)
router.post("/", ({}, body) => handlePostRoute(body))

export const handleRequest: HandleRequest = async function(request: HttpRequest): Promise<HttpResponse> {
    return await router.handleRequest(request, request.body)
}