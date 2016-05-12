package pivot.infrastructure.configuration

trait ConfigurationSource {
  def getValue(name: String): Option[String]

  def get(name: String, defaultValue: String): String = getValue(name).getOrElse(defaultValue)
  def get(name: String, defaultValue: Int): Int = getValue(name).map(s => Integer.parseInt(s)).getOrElse(defaultValue)
  def get(name: String, defaultValue: Boolean): Boolean = getValue(name).map(s => s.toLowerCase == "true").getOrElse(defaultValue)
}
