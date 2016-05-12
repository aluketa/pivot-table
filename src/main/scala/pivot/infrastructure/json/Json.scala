package pivot.infrastructure.json

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule

import scala.reflect.{ClassTag, _}

object Json {

  val objectMapper: ObjectMapper = {
    val om = new ObjectMapper
    om.registerModule(new JavaTimeModule)
    om.registerModule(DefaultScalaModule)
    om.registerModule(PivotModule)

    //Be liberal in what we accept from others
    om.enable(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES)
    om.enable(JsonParser.Feature.ALLOW_SINGLE_QUOTES)

    //Avoid losing precision when we read data
    om.enable(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS)

    //Serialize dates as "2015-10-16"
    om.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)

    //Be accepting of unknown properties
    om.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)

    om
  }

  def toConciseString(value: Any): String = objectMapper.writeValueAsString(value)

  def readValue[T: ClassTag](json: String): T =
    objectMapper.readValue(json, classTag[T].runtimeClass).asInstanceOf[T]
}
