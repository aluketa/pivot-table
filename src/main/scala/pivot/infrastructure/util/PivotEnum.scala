package pivot.infrastructure.util

import scala.reflect.runtime.universe._

trait PivotEnum {
  val name: String =
    this.getClass
      .getSimpleName
      .reverse
      .dropWhile(_ == '$')
      .reverse
}

object PivotEnum {
  private val mirror = runtimeMirror(getClass.getClassLoader)

  def valueOf[T: TypeTag](value: String): T = valueOf(value, typeOf[T].typeSymbol.asClass)

  def valueOf[T](value: String, cls: Class[T]): T = valueOf(value, mirror.classSymbol(cls))

  private def valueOf[T](value: String, cls: ClassSymbol): T = {
    val subclasses: Set[Symbol] =  cls.knownDirectSubclasses
    val subclass = subclasses.find(_.name.toString.toLowerCase == value.toLowerCase)

    subclass match {
      case Some(sc) => mirror.reflectModule(mirror.staticModule(sc.fullName)).instance.asInstanceOf[T]
      case None => throw new RuntimeException(s"Could not resolve enum value: $value")
    }
  }
}
