package pivot.infrastructure.json

import pivot.infrastructure.util.PivotEnum
import com.fasterxml.jackson.core.{JsonParser, JsonGenerator, Version}
import com.fasterxml.jackson.databind._
import com.fasterxml.jackson.databind.Module.SetupContext
import com.fasterxml.jackson.databind.deser.Deserializers
import com.fasterxml.jackson.databind.ser.Serializers

object PivotModule extends Module {
  override def setupModule(context: SetupContext): Unit = {
    context.addSerializers(PivotSerializers)
    context.addDeserializers(PivotDeserializers)
  }

  override def getModuleName: String = "PivotModule"
  override def version(): Version = Version.unknownVersion()
}

object PivotSerializers extends Serializers.Base {
  override def findSerializer(config: SerializationConfig, javaType: JavaType, beanDesc: BeanDescription): JsonSerializer[_] = {
    if (classOf[PivotEnum].isAssignableFrom(javaType.getRawClass)) {
      EnumSerializer
    } else {
      null
    }
  }
}

object EnumSerializer extends JsonSerializer[PivotEnum] {
  override def serialize(enum: PivotEnum, jsonGenerator: JsonGenerator, serializerProvider: SerializerProvider): Unit = {
    jsonGenerator.writeString(enum.name)
  }
}

object PivotDeserializers extends Deserializers.Base {
  override def findBeanDeserializer(javaType: JavaType, config: DeserializationConfig, beanDesc: BeanDescription): JsonDeserializer[_] = {
    if (classOf[PivotEnum].isAssignableFrom(javaType.getRawClass)) {
      new EnumDeserializer(javaType.getRawClass)
    } else {
      null
    }
  }
}

class EnumDeserializer[T](cls: Class[T]) extends JsonDeserializer[T] {
  override def deserialize(jsonParser: JsonParser, deserializationContext: DeserializationContext): T = {
    val stringValue = jsonParser.readValueAs(classOf[String])
    PivotEnum.valueOf[T](stringValue, cls)
  }
}
