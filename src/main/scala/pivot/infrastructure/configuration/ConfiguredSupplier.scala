package pivot.infrastructure.configuration

trait ConfiguredSupplier[T] {
  def configure(source: ConfigurationSource): T
}
