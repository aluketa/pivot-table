package pivot

import org.eclipse.jetty.server.Server
import org.slf4j.LoggerFactory.getLogger
import pivot.infrastructure.configuration.{ServerHandlerSupplier, PropertiesConfigurationSource}

object Pivot {
  private val logger = getLogger(getClass)

  def main(args: Array[String]) = {
    val serverPort = portFromArgs(args)
    logger.info(s"Starting Jersey server on port $serverPort")
    val source = new PropertiesConfigurationSource()
    val server = new Server(serverPort)
    server.setHandler(ServerHandlerSupplier.configure(source))
    server.start()
    server.join()
  }

  private def portFromArgs(args: Array[String]): Int = args.headOption match {
    case Some(portString) => Integer.parseInt(portString)
    case _ => throw new RuntimeException("Usage: pivot <port>")
  }

}
