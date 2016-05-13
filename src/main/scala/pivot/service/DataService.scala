package pivot.service

import javax.ws.rs.core.MediaType.APPLICATION_JSON
import javax.ws.rs.{Produces, GET, Path}

@Path("/data")
class DataService {

  @GET
  @Produces(Array(APPLICATION_JSON))
  def data: Seq[DataRow] = Seq(
    DataRow("Account 1", "Product 1", 3, 5),
    DataRow("Account 1", "Product 2", 7, 11),
    DataRow("Account 1", "Product 3", 13, 17),
    DataRow("Account 2", "Product 1", 19, 23),
    DataRow("Account 2", "Product 2", 29, 31),
    DataRow("Account 2", "Product 3", 37, 41),
    DataRow("Account 3", "Product 1", 43, 47),
    DataRow("Account 3", "Product 2", 53, 59),
    DataRow("Account 3", "Product 3", 61, 67)
  )
}

case class DataRow(accountName: String, productName: String, quantity: BigDecimal, marketValue: BigDecimal)