package pivot.infrastructure.configuration

import java.util.Properties

class PropertiesConfigurationSource(properties: Properties = System.getProperties) extends ConfigurationSource {
  override def getValue(name: String): Option[String] = Option(properties.getProperty(name))
}
